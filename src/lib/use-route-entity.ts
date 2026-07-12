import { ref, computed, onMounted, type Ref, type ComputedRef } from 'vue'
import type { EntityApi } from './entity-composable'

export interface RouteEntityResult<T> {
  id: Ref<string | null>
  entity: ComputedRef<T | undefined>
  loading: Ref<boolean>
}

export function useRouteEntity<T extends { id: string }>(
  api: EntityApi<T>,
  paramName = 'id',
): RouteEntityResult<T> {
  const id = ref<string | null>(null)
  const loading = ref(true)
  const entity = computed(() => (id.value ? api.get(id.value) : undefined))

  onMounted(() => {
    id.value = new URLSearchParams(window.location.search).get(paramName)
    loading.value = false
  })

  return { id, entity, loading }
}
