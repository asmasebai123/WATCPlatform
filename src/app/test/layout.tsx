// Layout minimal pour la page test (pas de sidebar pendant le test,
// afin d'avoir l'interface épurée demandée par §4.4).
export default function TestLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
