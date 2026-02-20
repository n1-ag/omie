import Link from 'next/link';
import type { MenuItem } from '@/lib/strapi/types';

interface FooterProps {
  navigation: MenuItem[];
}

export function Footer({ navigation }: FooterProps) {
  return (
    <footer
      className="border-t border-petroleo/10 bg-petroleo px-6 py-12 text-cinza-claro"
      role="contentinfo"
    >
      <div className="mx-auto max-w-[1320px]">
        <nav aria-label="Menu do rodapé" className="flex flex-wrap justify-center gap-6">
          {navigation.map((item) => (
            <Link
              key={item.id}
              href={item.url}
              className="text-sm font-semibold transition-colors hover:text-ciano"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <p className="mt-8 text-center text-sm text-cinza-claro/80">
          © {new Date().getFullYear()} OMIE. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
