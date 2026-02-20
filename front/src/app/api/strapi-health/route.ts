/**
 * Rota de diagnóstico: valida envs e conexão com a API do Strapi.
 * GET /api/strapi-health — retorna JSON com status (não expõe o token).
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const baseUrl = (process.env.STRAPI_API_URL ?? '').replace(/\/$/, '');
  const token = process.env.STRAPI_API_TOKEN ?? '';

  const menusTestUrl = `${baseUrl}/api/menus?pagination[pageSize]=5`;

  const result: {
    ok: boolean;
    env: {
      STRAPI_API_URL: string;
      STRAPI_API_URL_set: boolean;
      STRAPI_API_TOKEN_set: boolean;
      STRAPI_API_TOKEN_length: number;
    };
    strapi: {
      requestUrl: string;
      status: number | null;
      ok: boolean;
      errorDetail: string | null;
      headersSent: string[];
    };
    hint: string;
  } = {
    ok: false,
    env: {
      STRAPI_API_URL: baseUrl || '(vazio)',
      STRAPI_API_URL_set: Boolean(baseUrl),
      STRAPI_API_TOKEN_set: Boolean(token),
      STRAPI_API_TOKEN_length: token.length,
    },
    strapi: {
      requestUrl: '',
      status: null,
      ok: false,
      errorDetail: null,
      headersSent: [],
    },
    hint: '',
  };

  if (!baseUrl) {
    result.hint = 'STRAPI_API_URL está vazio. Defina no .env e reinicie o servidor.';
    return NextResponse.json(result, { status: 200 });
  }

  if (!token) {
    result.hint = 'STRAPI_API_TOKEN está vazio. Gere um token no Strapi (Settings → API Tokens) e defina no .env.';
    return NextResponse.json(result, { status: 200 });
  }

  try {
    result.strapi.requestUrl = menusTestUrl;
    const response = await fetch(menusTestUrl, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Strapi-Response-Format': 'v4',
        'User-Agent': 'NextJS-Strapi-Health/1.0',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    });
    result.strapi.status = response.status;
    result.strapi.ok = response.ok;
    result.strapi.headersSent = [
      'Accept: application/json',
      'Authorization: Bearer ***',
      'Content-Type: application/json',
      'Strapi-Response-Format: v4',
      'User-Agent: NextJS-Strapi-Health/1.0',
    ];
    if (!response.ok) {
      const body = await response.text();
      let detail = body;
      try {
        const parsed = JSON.parse(body) as { error?: { message?: string }; message?: string };
        detail = parsed.error?.message ?? parsed.message ?? body;
      } catch {
        detail = body.slice(0, 200);
      }
      result.strapi.errorDetail = detail;
      result.hint =
        `Strapi respondeu ${response.status}. Ver "strapi.errorDetail". ` +
        'Confira permissões do content-type Menu no Strapi.';
    } else {
      result.ok = true;
      result.hint = 'Conexão OK. Envs carregadas e API de menus respondeu 200.';
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    result.strapi.errorDetail = message;
    result.hint =
      'Falha ao conectar (rede/timeout). Confira STRAPI_API_URL, firewall e se o Strapi está no ar.';
  }

  return NextResponse.json(result, { status: 200 });
}
