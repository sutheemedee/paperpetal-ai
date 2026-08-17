import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/AuthProvider';
import type { DemoProject } from './demoTypes';

export const PENDING_TEMPLATE_KEY = 'paperpetal.pendingTemplate';

/**
 * "สร้างงานแบบนี้" — carries only the demo template (kind/tone/size), never its
 * prose. Visitors are routed to sign-up first, then into the matching studio.
 */
export const useCreateFromDemo = () => {
  const navigate = useNavigate();
  const { session } = useAuth();

  return (demo: DemoProject) => {
    try {
      localStorage.setItem(
        PENDING_TEMPLATE_KEY,
        JSON.stringify({ ...demo.template, from: demo.id, visualStyle: demo.visualStyle }),
      );
    } catch {
      /* storage disabled — template is optional */
    }
    if (!session) {
      navigate('/auth/sign-up?intent=template');
      return;
    }
    navigate(demo.kind === 'presentation' ? '/present' : '/book');
  };
};
