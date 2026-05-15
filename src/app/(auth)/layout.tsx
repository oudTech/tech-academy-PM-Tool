export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#000103]" style={{ backgroundImage: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(3,40,121,0.45) 0%, transparent 70%)" }}>
      {children}
    </div>
  );
}
