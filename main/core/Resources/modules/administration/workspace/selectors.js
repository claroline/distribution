export const select = {
  data: state => state.pagination.data,
  totalResults: state => state.pagination.totalResults,
  current: state => state.pagination.current || 1,
  selected: state => state.pagination.selected,
  pageSize: state => state.pagination.pageSize || 20,
  user: state => state.user
}
