export function ThemeScript() {
  const code = `(function(){document.documentElement.classList.remove('dark')})();`
  return <script dangerouslySetInnerHTML={{ __html: code }} />
}
