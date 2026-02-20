import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import { getMenus, getSiteConfig } from '@/lib/strapi/client';
import { Header } from '@/app/components/layout/Header';
import { Footer } from '@/app/components/layout/Footer';
import { AnalyticsScripts } from '@/app/components/layout/AnalyticsScripts';
import { StructuredDataScript } from '@/app/components/layout/StructuredDataScript';
import { getOrganizationAndWebSiteJsonLd } from '@/lib/seo/structured-data';
import './globals.css';

const poppins = Poppins({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  return {
    title: {
      default: config.siteTitle,
      template: '%s | OMIE',
    },
    description: config.siteDescription,
    icons: config.favicon ? { icon: config.favicon } : undefined,
    openGraph: {
      locale: 'pt_BR',
      ...(config.ogImage && { images: [{ url: config.ogImage }] }),
    },
    ...(config.gscVerification && {
      verification: { google: config.gscVerification },
    }),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [menus, siteConfig] = await Promise.all([getMenus(), getSiteConfig()]);

  const orgAndWebSiteJsonLd = getOrganizationAndWebSiteJsonLd(siteConfig);

  return (
    <html lang="pt-BR">
      <head>
        {siteConfig.logo && (
          <link
            rel="preload"
            href={siteConfig.logo}
            as="image"
            fetchPriority="high"
          />
        )}
        <StructuredDataScript data={orgAndWebSiteJsonLd} />
      </head>
      <body className={`${poppins.variable} min-h-screen font-sans antialiased`}>
        <AnalyticsScripts config={siteConfig} />
        <Header
          navigation={menus.header}
          logoUrl={siteConfig.logo}
          logoAlt={siteConfig.logoAlt}
        />
        <main className="min-h-[60vh]">{children}</main>
        <Footer navigation={menus.footer} />
      </body>
    </html>
  );
}
