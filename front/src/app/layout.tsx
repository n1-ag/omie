import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import { getMenus } from '@/lib/strapi/client';
import { Header } from '@/app/components/layout/Header';
import { Footer } from '@/app/components/layout/Footer';
import './globals.css';

const poppins = Poppins({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'OMIE | Sistema de Gestão ERP Online',
    template: '%s | OMIE',
  },
  description:
    'Sistema de gestão ERP online para PMEs e grandes empresas. Contabilidade, financeiro e mais.',
  openGraph: {
    locale: 'pt_BR',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const menus = await getMenus();

  return (
    <html lang="pt-BR">
      <body className={`${poppins.variable} min-h-screen font-sans antialiased`}>
        <Header navigation={menus.header} />
        <main className="min-h-[60vh]">{children}</main>
        <Footer navigation={menus.footer} />
      </body>
    </html>
  );
}
