import { ref, onMounted, type Ref } from 'vue'
import type { EntityApi } from './entity-composable'

export interface EntityListResult<T> {
  items: Ref<T[]>
  loading: Ref<boolean>
  reload: () => Promise<void>
}

export function useEntityList<T extends { id: string }>(api: EntityApi<T>): EntityListResult<T> {
  const items = ref<T[]>([]) as Ref<T[]>
  const loading = ref(true)

  async function reload(): Promise<void> {
    loading.value = true
    items.value = api.list()
    loading.value = false
  }

  onMounted(reload)

  return { items, loading, reload }
}
