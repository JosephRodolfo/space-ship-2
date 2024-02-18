import { reactive } from 'vue';

export function useKeyPress() {
  const keysPressed = reactive(new Set<string>());
  
  const onKeydown = (event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    if(['w', 'a', 's', 'd', 'j'].includes(key)) {
      keysPressed.add(key.toLowerCase());
    }
  };

  const onKeyup = (event: KeyboardEvent) => {
    keysPressed.delete(event.key.toLowerCase());
  };

  return {
    keysPressed,
    onKeydown,
    onKeyup,
  };
}
