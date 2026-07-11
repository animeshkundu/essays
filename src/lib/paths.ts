import { getTagSlug } from './content';

export function basePath(path = '') {
  const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
  const clean = path.replace(/^\/+/, '');
  return clean ? `${base}${clean}` : base;
}

export function postPath(id: string) {
  return basePath(`${id}/`);
}

export function tagPath(tag: string) {
  return basePath(`tags/${getTagSlug(tag)}/`);
}
