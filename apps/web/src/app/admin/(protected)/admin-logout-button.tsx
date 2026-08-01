'use client';

export function AdminLogoutButton() {
  const handleLogout = () => {
    document.cookie = 'admin_accessToken=; Max-Age=0; path=/';
    document.cookie = 'admin_refreshToken=; Max-Age=0; path=/';
    window.location.href = '/admin/login';
  };

  return (
    <button onClick={handleLogout} className="text-sm text-gray-300 hover:text-white">
      Sair
    </button>
  );
}
