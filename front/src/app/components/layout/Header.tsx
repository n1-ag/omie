import Link from 'next/link';
import type { MenuItem } from '@/lib/strapi/types';

interface HeaderProps {
  navigation: MenuItem[];
}

export function Header({ navigation }: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-50 border-b-[3px] border-[#00e2f4] bg-[#001e27] px-6 py-4"
      role="banner"
    >
      <div className="mx-auto flex max-w-[1320px] items-center justify-between">
        <Link
          href="/"
          className="text-lg font-bold text-[#00e2f4] transition-colors hover:text-white"
          aria-label="OMIE - Página inicial"
        >
          OMIE
        </Link>
        <nav aria-label="Menu principal" className="flex items-center gap-4">
          {navigation.map((item) => (
            <Link
              key={item.id}
              href={item.url}
              className="rounded-[40px] px-4 py-2 text-sm font-semibold text-[#f7f7f7] transition-all duration-200 hover:bg-[#00e2f4] hover:text-[#001e27]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
