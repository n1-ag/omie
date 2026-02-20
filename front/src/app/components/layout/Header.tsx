import Link from 'next/link';
import Image from 'next/image';
import type { MenuItem } from '@/lib/strapi/types';

interface HeaderProps {
  navigation: MenuItem[];
  logoUrl?: string;
  logoAlt?: string;
}

export function Header({ navigation, logoUrl, logoAlt = 'OMIE' }: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-50 border-b-[3px] border-ciano bg-petroleo px-6 py-4"
      role="banner"
    >
      <div className="mx-auto flex max-w-[1320px] items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold text-ciano transition-colors hover:text-white"
          aria-label="OMIE - Página inicial"
        >
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={logoAlt}
              width={120}
              height={40}
              className="h-10 w-auto object-contain"
              priority
              fetchPriority="high"
              unoptimized={logoUrl.startsWith('http')}
            />
          ) : (
            'OMIE'
          )}
        </Link>
        <nav aria-label="Menu principal" className="flex items-center gap-4">
          {navigation.map((item) => (
            <Link
              key={item.id}
              href={item.url}
              className="rounded-[40px] px-4 py-2 text-sm font-semibold text-cinza-claro transition-all duration-200 hover:bg-ciano hover:text-petroleo"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
