import { Link } from '@remix-run/react';

export default function Index() {
  return (
    <div className='mx-auto mt-12 max-w-prose text-center'>
      <h1 className='mb-4 text-3xl font-semibold text-sra-brand-orange-500'>
        Welcome to SRALab Tools
      </h1>
      <p className='mb-4 text-lg leading-relaxed'>
        I hope these tools save you some time. 😊
      </p>
      <p className='text-sm leading-tight'>
        Code for this website is public and can be viewed{' '}
        <a
          className='underline'
          href='https://github.com/SCasarotto/casarotto.family'
          target='_blank'
          rel='noreferrer noopener'
        >
          here
        </a>
        .
      </p>
      <p className='text-sm leading-tight'>
        For any bugs or feature requests provide them{' '}
        <a
          className='underline'
          href='https://github.com/SCasarotto/casarotto.family/issues'
          target='_blank'
          rel='noreferrer noopener'
        >
          here
        </a>
        .
      </p>
      <p className='mb-4 text-center leading-relaxed'>
        <Link to='/' className='mt-8 block underline'>
          Return Home
        </Link>
      </p>
    </div>
  );
}
