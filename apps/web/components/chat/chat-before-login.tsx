'use client';

import { useRouter } from 'next/navigation';

import PicoInput from '@/components/input/pico-input';
import Navbar02Page from '@/components/navbar-02/navbar-02';

export function ChatBeforeLogin() {
  const router = useRouter();

  const handleInputClick = () => {
    router.push('/auth/login');
  };

  return (
    <>
      <Navbar02Page />
      <PicoInput onInputClick={handleInputClick} />
    </>
  );
}
