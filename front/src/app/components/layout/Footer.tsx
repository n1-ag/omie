import Link from 'next/link';
import type { MenuItem } from '@/lib/strapi/types';

interface FooterProps {
  navigation: MenuItem[];
}

export function Footer({ navigation }: FooterProps) {
  return (
    <footer
      className="border-t border-[#001e27]/10 bg-[#001e27] px-6 py-12 text-[#f7f7f7]"
      role="contentinfo"
    >
      <div className="mx-auto max-w-[1320px]">
        <nav aria-label="Menu do rodapé" className="flex flex-wrap justify-center gap-6">
          {navigation.map((item) => (
            <Link
              key={item.id}
              href={item.url}
              className="text-sm font-semibold transition-colors hover:text-[#00e2f4]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <p className="mt-8 text-center text-sm text-[#f7f7f7]/80">
          © {new Date().getFullYear()} OMIE. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
