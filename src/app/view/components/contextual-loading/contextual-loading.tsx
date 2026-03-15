import LogoComponent from "@/app/view/components/ui/logo/logo";

export function ContextualLoading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black w-full h-full">
      <LogoComponent
        isAnimated={true}
        className="relative z-10 w-48 h-48 md:w-64 md:h-64"
      />

      <div className="mt-8 text-center animate-pulse">
        <p className="text-zinc-400 font-mono text-sm tracking-[0.2em] uppercase">
          Carregando sua casa
        </p>
      </div>
    </div>
  );
}

export default ContextualLoading;
