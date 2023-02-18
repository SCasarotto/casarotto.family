import { Link } from '@remix-run/react';

export default function Index() {
  return (
    <div className='p-3'>
      <h1 className='text-3xl'>Home</h1>
      <p className='mb-2'>
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
      <h2 className='mb-1 text-lg'>Sub projects</h2>
      <ul className='list-disc pl-6'>
        <li>
          <Link to='/matching-moments' className='underline'>
            Matching Moments
          </Link>{' '}
          - A game my mom loved to played recreated to never go away and support
          personalization.
        </li>
        <li>
          <Link to='/sralab-tools' className='underline'>
            SRA Lab Tools
          </Link>{' '}
          - Misc tools to help make SRA Lab employees day easier.
        </li>
      </ul>
    </div>
  );
}
