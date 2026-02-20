/**
 * Chamadas REST ao Strapi — site-config (Single Type).
 * Uso interno da ACL; componentes nunca importam daqui.
 */

const STRAPI_API_URL = (process.env.STRAPI_API_URL ?? '').replace(/\/$/, '');
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN ?? '';

const SITE_CONFIG_PATH = '/api/site-config';

const STRAPI_HEADERS: Record<string, string> = {
  Accept: 'application/json',
  Authorization: `Bearer ${STRAPI_API_TOKEN}`,
  'Content-Type': 'application/json',
  'Strapi-Response-Format': 'v4',
  'User-Agent': 'NextJS-Strapi-Client/1.0',
};

/** Strapi v5 Single Type: resposta é objeto único, não array. */
const SITE_CONFIG_QUERY =
  'populate[0]=logo&populate[1]=favicon&populate[2]=imagemRedesSociais&populate[3]=organizationStructuredData';

export interface OrganizationStructuredDataRaw {
  organizationJson?: { name?: string; url?: string; sameAs?: string[] };
}

export interface StrapiSiteConfigResponse {
  id?: number;
  documentId?: string;
  titulo?: string;
  descricao?: string;
  textoAlternativoLogo?: string;
  codigoGoogleAnalytics?: string;
  codigoGoogleTagManager?: string;
  codigoVerificacaoGoogle?: string;
  organizationStructuredData?: OrganizationStructuredDataRaw;
  logo?: { data?: { attributes?: { url?: string } } };
  favicon?: { data?: { attributes?: { url?: string } } };
  imagemRedesSociais?: { data?: { attributes?: { url?: string } } };
  attributes?: {
    titulo?: string;
    descricao?: string;
    textoAlternativoLogo?: string;
    codigoGoogleAnalytics?: string;
    codigoGoogleTagManager?: string;
    codigoVerificacaoGoogle?: string;
    organizationStructuredData?: OrganizationStructuredDataRaw;
    logo?: { data?: { attributes?: { url?: string } } };
    favicon?: { data?: { attributes?: { url?: string } } };
    imagemRedesSociais?: { data?: { attributes?: { url?: string } } };
  };
}

export async function fetchSiteConfigFromStrapi(): Promise<StrapiSiteConfigResponse | null> {
  const url = `${STRAPI_API_URL}${SITE_CONFIG_PATH}?${SITE_CONFIG_QUERY}`;
  const response = await fetch(url, {
    headers: STRAPI_HEADERS,
    next: { revalidate: 300 },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    if (response.status === 404) return null;
    const body = await response.text();
    let detail = body;
    try {
      const parsed = JSON.parse(body) as {
        error?: { message?: string };
        message?: string;
      };
      detail = parsed.error?.message ?? parsed.message ?? body;
    } catch {
      detail = body.slice(0, 200);
    }
    throw new Error(`Strapi API error: ${response.status}. ${detail}`);
  }

  const json = (await response.json()) as { data?: StrapiSiteConfigResponse | null };
  return json.data ?? null;
}
