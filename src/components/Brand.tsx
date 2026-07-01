// iTourist wordmark: an orange lowercase "i" + "Tourist". `tone` adapts the
// second half for light vs dark surfaces.
export default function Brand({ tone = 'light', className = 'text-2xl' }: { tone?: 'light' | 'dark'; className?: string }) {
  return (
    <span className={`font-display font-bold ${className}`}>
      <span className="text-ochre-500">i</span>
      <span className={tone === 'dark' ? 'text-white' : 'text-majolica-700'}>Tourist</span>
    </span>
  );
}
