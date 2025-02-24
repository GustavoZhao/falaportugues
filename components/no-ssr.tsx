import { useEffect, useState } from 'react';

const NoSSR: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return isMounted ? <>{children}</> : null; // 仅在客户端渲染子组件
};

export default NoSSR; 