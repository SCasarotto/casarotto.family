import type { MetaFunction } from '@remix-run/node';
import { Link } from '@remix-run/react';

import logo from '~/assets/images/logo.png';

export const meta: MetaFunction = () => ({
  title: 'Casarotto Family | Home',
  description:
    'A site of misc things and side projects created by Stuart Casarotto.',
});

const Projects = [
  {
    to: '/matching-moments',
    title: 'Matching Moments',
    description:
      'A game my mom loved to played recreated to never go away and support personalization.',
  },
  {
    to: '/sralab-tools',
    title: 'SRA Lab Tools',
    description: 'Misc tools to help make SRA Lab employees day easier.',
    subPages: [
      {
        to: '/sralab-tools/adp-calculator',
        title: 'ADP Calculator',
      },
      {
        to: '/sralab-tools/pto-calculator',
        title: 'PTO Calculator',
      },
    ],
  },
];

export default function Index() {
  return (
    <div className='flex flex-col items-center p-3 pt-8'>
      <div className='mb-8 max-w-prose text-center'>
        <img
          src={logo}
          alt='Casarotto Family Logo'
          className='mb-4 inline-block w-24'
        />
        <h1 className='mb-4 text-4xl'>Home</h1>
        <p className='mb-2 text-left'>
          This site is a repository of Casarotto family misc things and side
          projects created by Stuart Casarotto. You can find the code for this
          entire website{' '}
          <a
            href='https://github.com/SCasarotto/casarotto.family'
            target='_blank'
            rel='noreferrer'
            className='underline'
          >
            here
          </a>
          .
        </p>
      </div>
      <div className='w-full max-w-screen-lg'>
        <h2 className='mb-4 text-2xl'>Projects</h2>
        <ul className='grid grid-cols-3 gap-3'>
          {Projects.map((project) => {
            const { to, title, description, subPages } = project;
            return (
              <Link to={to} key={to}>
                <li
                  className={
                    'h-full rounded-lg border border-gray-200 p-4 transition hover:bg-gray-100'
                  }
                >
                  <h3 className='mb-3 text-xl leading-4'>{title}</h3>
                  <p className='text-left leading-5'>{description}</p>
                  {subPages && (
                    <ul className='mt-3 list-disc pl-3'>
                      {subPages.map((subPage) => (
                        <li key={subPage.to}>
                          <Link to={subPage.to} className='underline'>
                            {subPage.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              </Link>
            );
          })}
          {/* <ProjectCard to='/matching-moments'>
            Matching Moments - A game my mom loved to played recreated to never
            go away and support personalization.
          </ProjectCard>
          <ProjectCard to='/sralab-tools'>
            SRA Lab Tools - Misc tools to help make SRA Lab employees day
            easier.
          </ProjectCard> */}
        </ul>
      </div>
    </div>
  );
}
