import { createClient } from '@/lib/supabase/server'
import { ProjectGrid } from '@/components/projects/project-grid'

export const dynamic = 'force-dynamic'

export default async function ProjectsPage() {
  const supabase = await createClient()

  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .order('name')

  if (error) {
    console.error('Failed to fetch projects:', error.message)
  }

  return <ProjectGrid projects={projects ?? []} />
}
