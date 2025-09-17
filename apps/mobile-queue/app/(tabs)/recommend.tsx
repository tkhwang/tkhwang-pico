import React from 'react';
import { MainLayout } from '@/components/main-layout';
import { RecommendList } from '@/components/recommend/list/recommend-list';

export default function RecommendScreen() {
  return (
    <MainLayout>
      <RecommendList />
    </MainLayout>
  );
}
