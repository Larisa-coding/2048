export const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path
      d="M19.4 13a7.8 7.8 0 0 0 .05-2l2.05-1.6-2-3.46-2.45.75a7.9 7.9 0 0 0-1.73-1L15 2h-6l-.37 2.69a7.9 7.9 0 0 0-1.73 1L4.5 4.94l-2 3.46L4.55 10a7.8 7.8 0 0 0 0 2l-2.05 1.6 2 3.46 2.45-.75a7.9 7.9 0 0 0 1.73 1L9 22h6l.37-2.69a7.9 7.9 0 0 0 1.73-1l2.45.75 2-3.46L19.4 13Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </svg>
)

export const ThemeIcon = ({ dark }: { dark: boolean }) =>
  dark ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3a9 9 0 1 0 9 9c0-.4-.02-.8-.07-1.18A7 7 0 0 1 12 3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
