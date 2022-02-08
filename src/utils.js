function clamp(value, min_v, max_v)
{
  return Math.max(min_v, Math.min(value, max_v));
}

export { clamp };