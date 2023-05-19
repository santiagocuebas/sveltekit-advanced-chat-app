export function clickOutside(node: Node) {
  const handleClick = (e: Event) => {
		if (!node.contains(e.target as HTMLElement)) {
			node.dispatchEvent(new CustomEvent('outclick'));
		}
	};

  document.addEventListener('click', handleClick, false);

  return {
		destroy() {
			document.removeEventListener('click', handleClick, false);
		}
	}
}
