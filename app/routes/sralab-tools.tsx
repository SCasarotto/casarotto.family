import { NavLink, Outlet } from '@remix-run/react';

const navBarLinkArray = [
  { to: '/sralab-tools/adp-calculator', label: 'ADP Calculator' },
  { to: '/sralab-tools/pto-calculator', label: 'PTO Calculator' },
];

const SralabToolsLayout = () => (
  <>
    <nav className='flex justify-between bg-sra-brand-orange-500 px-5 py-3'>
      <NavLink to='/sralab-tools'>
        <h1 className='text-3xl font-bold text-white'>SRALab Tools</h1>
      </NavLink>
      <ul className='flex items-center'>
        {navBarLinkArray.map((link) => (
          <li key={link.to} className='px-2 text-white'>
            <NavLink
              to={link.to}
              className={({ isActive }) =>
                `block border-b-2 text-lg ${
                  isActive ? 'border-white' : 'border-transparent'
                } hover:border-white`
              }
            >
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
    <Outlet />
  </>
);

export default SralabToolsLayout;
