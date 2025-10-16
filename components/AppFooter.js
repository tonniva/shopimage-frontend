export default function AppFooter() {
    return (
      <footer className="mt-12 border-t border-black bg-white">
      <div className="mx-auto max-w-6xl px-4 py-6 grid gap-3 sm:grid-cols-2 items-center">
        <div className="text-sm text-gray-600 leading-relaxed">
          © {new Date().getFullYear()} To Webp — 100% of all support is used for cat food only.
          <div className="text-xs text-gray-500">
            👉 *Files auto deleted after midnight 🔥
          </div>
        </div>
        <div className="flex sm:justify-end gap-3 text-sm">
          <a
            href="mailto:tongiggabite@gmail.com"
            className="underline-offset-4 hover:underline"
          >
            Support
          </a>
        </div>
      </div>
    </footer>
    );
  }