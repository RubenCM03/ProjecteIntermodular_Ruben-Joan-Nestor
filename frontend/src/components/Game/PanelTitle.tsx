export function PanelTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="f-mono text-[9px] tracking-[3px] uppercase text-[#5a7a8a] border-b border-[rgba(10,197,168,.13)] pb-1.5 mb-3">
      {children}
    </p>
  );
}