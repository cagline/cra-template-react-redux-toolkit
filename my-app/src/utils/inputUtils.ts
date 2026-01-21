function scan(e: any) {
  if (e.key === 'Enter' || e.keyCode === 13) {
    return e.target.value.trim();
  }
}

export { scan };
