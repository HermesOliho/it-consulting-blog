import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Field from '../../../components/ui/Field'
import { listCategories } from '../../../api/articles'
import { createArticle, getAdminArticle, updateArticle } from '../../../api/adminArticles'
import { getErrorMessage } from '../../../lib/http'
import { ARTICLE_STATUS_LABELS } from '../../../lib/labels'
import { isHttpUrl, slugify } from '../../../lib/validation'
import type { ArticleStatus, Category } from '../../../types'
import type { ArticleInput } from '../../../types/inputs'
import '../../../styles/admin.css'

interface FormState {
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image: string
  category_id: string // "" = aucune catégorie
}
type FormErrors = Partial<Record<keyof FormState, string>>

const EMPTY_FORM: FormState = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  cover_image: '',
  category_id: '',
}

// Un slug = lettres minuscules, chiffres et tirets : "mon-premier-article"
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export default function ArticleEditorPage() {
  const { id } = useParams() // présent seulement en modification
  const navigate = useNavigate()
  const articleId = id ? Number(id) : null
  const isEdit = articleId !== null

  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [slugTouched, setSlugTouched] = useState(isEdit) // true = on ne génère plus le slug automatiquement
  const [currentStatus, setCurrentStatus] = useState<ArticleStatus>('DRAFT')
  const [categories, setCategories] = useState<Category[]>([])
  const [loadStatus, setLoadStatus] = useState<'loading' | 'error' | 'ready'>('loading')
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Chargement des catégories (+ de l'article en modification)
  useEffect(() => {
    let cancelled = false

    Promise.all([
      listCategories(),
      articleId === null ? Promise.resolve(null) : getAdminArticle(articleId),
    ])
      .then(([cats, article]) => {
        if (cancelled) return
        setCategories(cats)
        if (article) {
          setForm({
            title: article.title,
            slug: article.slug,
            excerpt: article.excerpt,
            content: article.content,
            cover_image: article.cover_image ?? '',
            category_id: article.category ? String(article.category.id) : '',
          })
          setCurrentStatus(article.status)
        }
        setLoadStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setLoadStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [articleId])

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  // Quand on tape le titre, le slug se génère tout seul (tant qu'on ne l'a pas modifié à la main)
  function changeTitle(value: string) {
    setForm((current) => ({
      ...current,
      title: value,
      slug: slugTouched ? current.slug : slugify(value),
    }))
  }

  // Vérifie les champs avant l'envoi (le serveur revérifie : RG12)
  function validate(): FormErrors {
    const found: FormErrors = {}
    const title = form.title.trim()
    const slug = form.slug || slugify(form.title)
    const cover = form.cover_image.trim()

    if (title.length < 3 || title.length > 150) {
      found.title = 'Le titre doit contenir entre 3 et 150 caractères.'
    }
    if (!SLUG_PATTERN.test(slug)) {
      found.slug = 'Adresse invalide : lettres minuscules, chiffres et tirets uniquement.'
    }
    if (!form.content.trim()) {
      found.content = 'Le contenu est obligatoire.'
    }
    if (form.excerpt.length > 300) {
      found.excerpt = 'Le résumé ne doit pas dépasser 300 caractères.'
    }
    // On n'accepte que des adresses http(s) pour l'image (refuse "javascript:" etc.)
    if (cover && !isHttpUrl(cover)) {
      found.cover_image = "Saisissez l'adresse complète de l'image (https://...)."
    }
    return found
  }

  // Enregistre l'article avec le statut voulu (brouillon ou publié)
  async function save(target: ArticleStatus) {
    const found = validate()
    setErrors(found)
    setSubmitError('')
    if (Object.keys(found).length > 0) return

    const content = form.content.trim()
    const input: ArticleInput = {
      title: form.title.trim(),
      slug: form.slug || slugify(form.title),
      // Résumé vide : on prend le début du contenu
      excerpt: form.excerpt.trim() || content.slice(0, 160),
      content,
      cover_image: form.cover_image.trim() || null,
      category_id: form.category_id ? Number(form.category_id) : null,
      status: target,
    }

    setSubmitting(true)
    try {
      if (articleId === null) await createArticle(input)
      else await updateArticle(articleId, input)
      navigate('/admin/articles')
    } catch (error) {
      setSubmitError(getErrorMessage(error))
      setSubmitting(false)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void save('PUBLISHED') // le bouton principal publie (ou enregistre un article déjà publié)
  }

  const isPublished = currentStatus === 'PUBLISHED'

  return (
    <>
      <header className="admin-head">
        <div>
          <h1>{isEdit ? "Modifier l'article" : 'Nouvel article'}</h1>
          <p>
            <Link to="/admin/articles">← Retour aux articles</Link>
            {isEdit && (
              <>
                {' · '}
                <span className={`badge${isPublished ? ' badge--success' : ''}`}>
                  {ARTICLE_STATUS_LABELS[currentStatus]}
                </span>
              </>
            )}
          </p>
        </div>
      </header>

      {loadStatus === 'loading' && (
        <p className="admin-message" role="status">
          Chargement…
        </p>
      )}
      {loadStatus === 'error' && (
        <p className="admin-message" role="alert">
          Impossible de charger cet article ou les catégories.
        </p>
      )}

      {loadStatus === 'ready' && (
        <form className="card form-card" onSubmit={handleSubmit} noValidate>
          {submitError && (
            <p className="alert" role="alert">
              {submitError}
            </p>
          )}

          <Field id="title" label="Titre" error={errors.title}>
            <input
              id="title"
              className="input"
              value={form.title}
              onChange={(e) => changeTitle(e.target.value)}
              maxLength={150}
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? 'title-error' : undefined}
            />
          </Field>

          <div className="form-row form-row--2">
            <Field
              id="slug"
              label="Adresse de l'article"
              error={errors.slug}
              hint={`/articles/${form.slug || '…'}`}
            >
              <input
                id="slug"
                className="input"
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true)
                  update('slug', e.target.value.toLowerCase())
                }}
                maxLength={100}
                aria-invalid={Boolean(errors.slug)}
                aria-describedby={errors.slug ? 'slug-error' : undefined}
              />
            </Field>

            <Field id="category" label="Catégorie">
              <select
                id="category"
                className="input"
                value={form.category_id}
                onChange={(e) => update('category_id', e.target.value)}
              >
                <option value="">Aucune catégorie</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field
            id="cover_image"
            label="Image de couverture (adresse web, facultatif)"
            error={errors.cover_image}
          >
            <input
              id="cover_image"
              className="input"
              type="url"
              placeholder="https://..."
              value={form.cover_image}
              onChange={(e) => update('cover_image', e.target.value)}
              maxLength={500}
              aria-invalid={Boolean(errors.cover_image)}
              aria-describedby={errors.cover_image ? 'cover_image-error' : undefined}
            />
          </Field>

          <Field
            id="excerpt"
            label="Résumé"
            error={errors.excerpt}
            hint="Facultatif : si vide, le début du contenu sera utilisé."
          >
            <textarea
              id="excerpt"
              className="textarea"
              rows={3}
              value={form.excerpt}
              onChange={(e) => update('excerpt', e.target.value)}
              maxLength={300}
              aria-invalid={Boolean(errors.excerpt)}
              aria-describedby={errors.excerpt ? 'excerpt-error' : undefined}
            />
          </Field>

          <Field
            id="content"
            label="Contenu"
            error={errors.content}
            hint="Texte simple : sautez une ligne pour commencer un nouveau paragraphe."
          >
            <textarea
              id="content"
              className="textarea"
              rows={14}
              value={form.content}
              onChange={(e) => update('content', e.target.value)}
              aria-invalid={Boolean(errors.content)}
              aria-describedby={errors.content ? 'content-error' : undefined}
            />
          </Field>

          <div className="form-actions">
            {/* Bouton principal : publie, ou enregistre les modifications d'un article déjà publié */}
            <button type="submit" className="btn btn--primary" disabled={submitting}>
              {submitting ? 'Enregistrement…' : isPublished ? 'Enregistrer les modifications' : 'Publier'}
            </button>
            {/* Bouton secondaire : brouillon (invisible du public, règle RG07) */}
            <button
              type="button"
              className="btn btn--ghost"
              disabled={submitting}
              onClick={() => void save('DRAFT')}
            >
              {isPublished ? 'Repasser en brouillon' : 'Enregistrer le brouillon'}
            </button>
            <Link to="/admin/articles" className="btn btn--ghost">
              Annuler
            </Link>
          </div>
        </form>
      )}
    </>
  )
}