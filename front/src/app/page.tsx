import { getSiteConfig } from '@/lib/strapi/client';
import { buildMetadataFromSeo, getSiteBaseUrl } from '@/lib/seo/metadata';

export const revalidate = 60;

export async function generateMetadata() {
  const siteConfig = await getSiteConfig();
  const baseUrl = getSiteBaseUrl();
  return buildMetadataFromSeo(undefined, siteConfig, {
    pageTitle: siteConfig.siteTitle,
    url: baseUrl || '/',
    image: siteConfig.ogImage || undefined,
  });
}

export default async function HomePage() {
  return (
    <div className="section-padding">
      <div className="mx-auto max-w-[1320px] px-6">
        <section className="mb-16 text-center">
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">
            Sistema de Gestão ERP Online
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-foreground/80">
            Para PMEs e grandes empresas. Conteúdo institucional e blog geridos pelo Strapi.
          </p>
        </section>
      </div>
    </div>
  );
}
