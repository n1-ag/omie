/**
 * Injeta JSON-LD (dados estruturados) no head da página.
 * Uso: Organization, WebSite, Article, BreadcrumbList.
 */

interface StructuredDataScriptProps {
  data: object | object[];
}

export function StructuredDataScript({ data }: StructuredDataScriptProps) {
  const jsonLd = Array.isArray(data) ? data : [data];
  const validItems = jsonLd.filter(
    (item) => item && typeof item === 'object' && Object.keys(item).length > 0
  );
  if (validItems.length === 0) return null;

  return (
    <>
      {validItems.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
}
