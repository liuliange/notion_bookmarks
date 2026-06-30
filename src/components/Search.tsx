'use client';

import { SearchIcon } from 'lucide-react';
import { useSearchContext } from './search-context';

export function Search() {
  const { searchQuery, setSearchQuery } = useSearchContext();

  return (
    <div className='relative flex items-center w-full max-w-xs'>
      <input
        type='text'
        placeholder='搜索优惠券'
        className='w-full pl-3 pr-8 py-1.5 text-base rounded-md border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none'
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        autoCorrect='off'
        autoCapitalize='off'
        spellCheck='false'
      />
      <SearchIcon className='size-4 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400' />
    </div>
  );
}