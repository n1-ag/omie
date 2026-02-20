'use client';

import { useEffect } from 'react';

export default function BlogError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Blog error:', error);
  }, [error]);

  return (
    <div className="section-padding">
      <div className="mx-auto max-w-[1320px] px-6 text-center">
        <h2 className="text-xl font-bold text-foreground">
          Algo deu errado ao carregar o blog
        </h2>
        <p className="mt-2 text-foreground/70">
          Tente novamente em alguns instantes.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-[40px] border-[3px] border-petroleo bg-petroleo px-6 py-2.5 font-bold text-white transition-all hover:shadow-[0_6px_0_0_var(--shadow-petroleo)]"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
