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
        <h2 className="text-xl font-bold text-[#001e27]">
          Algo deu errado ao carregar o blog
        </h2>
        <p className="mt-2 text-[#001e27]/70">
          Tente novamente em alguns instantes.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-[40px] border-[3px] border-[#001e27] bg-[#001e27] px-6 py-2.5 font-bold text-white transition-all hover:shadow-[0_6px_0_0_rgba(0,30,39,.4)]"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
