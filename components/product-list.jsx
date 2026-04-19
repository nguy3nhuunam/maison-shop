import ProductCard from "@/components/ProductCard";

export default function ProductList({
  products = [],
  onProductSelect,
  emptyMessage,
}) {
  return (
    <section className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
      {products.length === 0 ? (
        <div className="luxury-card col-span-full rounded-[32px] p-10 text-center text-sm text-stone-500">
          {emptyMessage}
        </div>
      ) : null}

      {products.map((product) => {
        return (
          <ProductCard key={product.id} product={product} onSelect={onProductSelect} />
        );
      })}
    </section>
  );
}
