export const revalidate = 60;

export default async function HomePage() {
  return (
    <div className="section-padding">
      <div className="mx-auto max-w-[1320px] px-6">
        <section className="mb-16 text-center">
          <h1 className="text-3xl font-bold text-[#001e27] md:text-4xl">
            Sistema de Gestão ERP Online
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[#001e27]/80">
            Para PMEs e grandes empresas. Conteúdo institucional e blog geridos pelo Strapi.
          </p>
        </section>
      </div>
    </div>
  );
}
