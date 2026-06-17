import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/profile/artist/route'

const mockGetUser = vi.fn()
vi.mock('@/lib/auth', () => ({
  createServerClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
  })),
}))

// vi.hoisted runs before vi.mock factories, making these safe to reference inside them
const {
  mockSelect,
  mockFrom,
  mockWhere,
  mockLimit,
  mockInsert,
  mockValues,
  mockOnConflictDoNothing,
} = vi.hoisted(() => ({
  mockSelect: vi.fn(),
  mockFrom: vi.fn(),
  mockWhere: vi.fn(),
  mockLimit: vi.fn(),
  mockInsert: vi.fn(),
  mockValues: vi.fn(),
  mockOnConflictDoNothing: vi.fn(),
}))

vi.mock('@/lib/db', () => ({
  db: { select: mockSelect, insert: mockInsert },
}))

vi.mock('@/lib/db/schema', () => ({
  artistProfilesSchema: { membersWithAccess: 'membersWithAccess' },
}))

vi.mock('drizzle-orm', () => ({
  arrayContains: vi.fn(() => 'mock-condition'),
}))

function makeRequest(body: object) {
  return new Request('http://localhost/api/profile/artist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

const validProfileData = {
  artistName: 'Test Artist',
  fullName: 'Test User',
  contactEmail: 'test@example.com',
  city: 'New York',
  state: 'NY',
  country: 'US',
  genre: 'Rock',
  members: '3',
  artistDescription: 'A test band',
  website: 'https://testartist.com',
  facebook: '',
  instagram: '',
  tiktok: '',
  spotify: '',
  appleMusic: '',
  soundcloud: '',
}

describe('POST /api/profile/artist', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockOnConflictDoNothing.mockResolvedValue(undefined)
    mockValues.mockReturnValue({ onConflictDoNothing: mockOnConflictDoNothing })
    mockInsert.mockReturnValue({ values: mockValues })
    mockWhere.mockReturnValue({ limit: mockLimit })
    mockFrom.mockReturnValue({ where: mockWhere })
    mockSelect.mockReturnValue({ from: mockFrom })
  })

  it('returns 500 on auth error', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: new Error('Auth failed') })

    const response = await POST(makeRequest({}))
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.error).toBe('Internal Server Error')
  })

  it('returns 401 when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

    const response = await POST(makeRequest({}))
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.error).toBe('Unauthorized')
  })

  it('returns 400 when a profile already exists for this user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })
    mockLimit.mockResolvedValue([{ id: 'existing-profile' }])

    const response = await POST(makeRequest(validProfileData))
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toBe('Profile already exists')
  })

  it('inserts profile and returns success when user has no existing profile', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })
    mockLimit.mockResolvedValue([])

    const response = await POST(makeRequest(validProfileData))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(mockInsert).toHaveBeenCalled()
    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({
        artistName: 'Test Artist',
        fullName: 'Test User',
        contactEmail: 'test@example.com',
        membersWithAccess: ['user-1'],
        songClips: [],
      })
    )
  })

  it('sets joinedDate to a Date on insert', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })
    mockLimit.mockResolvedValue([])

    await POST(makeRequest(validProfileData))

    const insertedValues = mockValues.mock.calls[0][0]
    expect(insertedValues.joinedDate).toBeInstanceOf(Date)
  })

  it('returns 500 when the database insert fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })
    mockLimit.mockResolvedValue([])
    mockOnConflictDoNothing.mockRejectedValue(new Error('DB connection lost'))

    const response = await POST(makeRequest(validProfileData))
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.error).toBe('DB connection lost')
  })
})
