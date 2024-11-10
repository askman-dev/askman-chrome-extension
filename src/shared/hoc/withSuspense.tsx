import React, { Suspense } from 'react';

function withSuspense<T extends Record<string, unknown>>(
  WrappedComponent: React.ComponentType<T>,
  FallbackComponent: React.ReactNode,
): React.FC<T> {
  const WithSuspense = (props: T): React.ReactElement => (
    <Suspense fallback={FallbackComponent}>
      <WrappedComponent {...props} />
    </Suspense>
  );
  return WithSuspense;
}

export default withSuspense;
