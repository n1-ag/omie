import Link from 'next/link';

export default function PostNotFound() {
  return (
    <div className="section-padding">
      <div className="mx-auto max-w-[1320px] px-6 text-center">
        <h1 className="text-2xl font-bold text-foreground">Post não encontrado</h1>
        <p className="mt-2 text-foreground/70">
          O artigo que você procura não existe ou foi removido.
        </p>
        <Link
          href="/blog"
          className="mt-6 inline-block rounded-[40px] border-[3px] border-ciano bg-ciano px-6 py-2.5 font-bold text-petroleo transition-all duration-200 hover:shadow-[0_6px_0_0_var(--shadow-ciano)]"
        >
          Voltar ao blog
        </Link>
      </div>
    </div>
  );
}
