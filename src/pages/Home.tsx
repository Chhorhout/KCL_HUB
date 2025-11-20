import { Link } from 'react-router-dom'

export function Home() {
  return (
    <main className="home-page max-w-7xl mx-auto px-6 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">សូមស្វាគមន៍មកកាន់ AMS Dashboard</h1>
        <p className="text-slate-600">ផ្ទាំងគ្រប់គ្រង</p>
      </div>

      {/* User Guide Content */}
      <div className="max-w-4xl">
        {/* Login Section */}
        <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            ចូលប្រើប្រាស់
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-slate-700">
            <li>បញ្ចូល <strong>ឈ្មោះអ្នកប្រើប្រាស់</strong> និង <strong>ពាក្យសម្ងាត់</strong></li>
            <li>ចុច <strong>ចូលប្រើប្រាស់</strong></li>
          </ol>
        </section>

        {/* Logout Section */}
        <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            ចេញពីប្រើប្រាស់
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-slate-700">
            <li>ចុចប៊ូតុង <strong>ចេញពីប្រើប្រាស់</strong> (ខាងស្ដាំលើ)</li>
            <li>បញ្ជាក់ក្នុងបង្អួចប៉ុប</li>
          </ol>
        </section>

        {/* HRMS Department Section */}
        <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            HRMS - ការគ្រប់គ្រងនាយកដ្ឋាន
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">មើលនាយកដ្ឋាន</h3>
              <p className="text-slate-700">ទៅកាន់ <Link to="/hrms/department" className="text-blue-600 hover:underline">HRMS → Department</Link> ពីរបារចំហៀង។ មើលនាយកដ្ឋានទាំងអស់ជាមួយចំនួនបុគ្គលិក។</p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">បន្ថែមនាយកដ្ឋាន</h3>
              <ol className="list-decimal list-inside space-y-1 text-slate-700 ml-4">
                <li>ចុចប៊ូតុង <strong>បន្ថែម</strong></li>
                <li>បញ្ចូលឈ្មោះនាយកដ្ឋាន</li>
                <li>ចុច <strong>បន្ថែមនាយកដ្ឋាន</strong></li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">កែប្រែនាយកដ្ឋាន</h3>
              <ol className="list-decimal list-inside space-y-1 text-slate-700 ml-4">
                <li>ចុចរូបសញ្ញា <strong>កែប្រែ</strong> (ខ្មៅដៃ) នៅក្បែរនាយកដ្ឋាន</li>
                <li>ផ្លាស់ប្តូរឈ្មោះ</li>
                <li>ចុច <strong>ធ្វើបច្ចុប្បន្នភាពនាយកដ្ឋាន</strong></li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">លុបនាយកដ្ឋាន</h3>
              <ol className="list-decimal list-inside space-y-1 text-slate-700 ml-4">
                <li>ចុចរូបសញ្ញា <strong>លុប</strong> (X) នៅក្បែរនាយកដ្ឋាន</li>
                <li>បញ្ជាក់ក្នុងបង្អួចប៉ុប</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">មើលបុគ្គលិក</h3>
              <p className="text-slate-700">ចុចឈ្មោះនាយកដ្ឋាន ឬចំនួនបុគ្គលិក ដើម្បីមើលបុគ្គលិកក្នុងនាយកដ្ឋាននោះ។</p>
            </div>
          </div>
        </section>

        {/* HRMS Employee Section */}
        <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            HRMS - ការគ្រប់គ្រងបុគ្គលិក
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">មើលបុគ្គលិក</h3>
              <p className="text-slate-700">ទៅកាន់ <Link to="/hrms/employee" className="text-blue-600 hover:underline">HRMS → Employee</Link> ពីរបារចំហៀង។ មើលបុគ្គលិកទាំងអស់ក្នុងតារាងដែលមានទំព័រ។</p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">បន្ថែមបុគ្គលិក</h3>
              <ol className="list-decimal list-inside space-y-1 text-slate-700 ml-4">
                <li>ចុចប៊ូតុង <strong>បន្ថែម</strong></li>
                <li>បំពេញព័ត៌មានដែលត្រូវការ:
                  <ul className="list-disc list-inside ml-6 mt-1">
                    <li>ឈ្មោះ, នាមត្រកូល</li>
                    <li>អ៊ីម៉ែល, លេខទូរសព្ទ</li>
                    <li>ថ្ងៃខែឆ្នាំកំណើត, ថ្ងៃចូលធ្វើការ</li>
                    <li>នាយកដ្ឋាន (ជ្រើសរើស ឬបង្កើតថ្មី)</li>
                  </ul>
                </li>
                <li>ចុច <strong>បន្ថែមបុគ្គលិក</strong></li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">បង្កើតនាយកដ្ឋានខណៈពេលបន្ថែមបុគ្គលិក</h3>
              <ol className="list-decimal list-inside space-y-1 text-slate-700 ml-4">
                <li>ចុច <strong>+ ថ្មី</strong> នៅក្បែរបញ្ចុះនាយកដ្ឋាន</li>
                <li>បញ្ចូលឈ្មោះនាយកដ្ឋាន</li>
                <li>ចុច <strong>បង្កើត</strong></li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">កែប្រែបុគ្គលិក</h3>
              <ol className="list-decimal list-inside space-y-1 text-slate-700 ml-4">
                <li>ចុចរូបសញ្ញា <strong>កែប្រែ</strong> (ខ្មៅដៃ)</li>
                <li>ធ្វើបច្ចុប្បន្នភាពព័ត៌មាន</li>
                <li>ចុច <strong>ធ្វើបច្ចុប្បន្នភាពបុគ្គលិក</strong></li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">លុបបុគ្គលិក</h3>
              <ol className="list-decimal list-inside space-y-1 text-slate-700 ml-4">
                <li>ចុចរូបសញ្ញា <strong>លុប</strong> (X)</li>
                <li>បញ្ជាក់ក្នុងបង្អួចប៉ុប</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">ត្រងតាមនាយកដ្ឋាន</h3>
              <p className="text-slate-700">ចុចឈ្មោះនាយកដ្ឋានក្នុងបញ្ជីបុគ្គលិកដើម្បីត្រង។ ចុច <strong>លុបត្រង</strong> ដើម្បីបង្ហាញបុគ្គលិកទាំងអស់។</p>
            </div>
          </div>
        </section>

        {/* Pagination Section */}
        <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            ការប្រើប្រាស់ទំព័រ
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <div className="text-2xl font-bold text-slate-700 mb-1">««</div>
              <div className="text-sm text-slate-600">ទំព័រដំបូង</div>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <div className="text-2xl font-bold text-slate-700 mb-1">‹</div>
              <div className="text-sm text-slate-600">មុន</div>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">1</div>
              <div className="text-sm text-slate-600">លេខទំព័រ</div>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <div className="text-2xl font-bold text-slate-700 mb-1">›</div>
              <div className="text-sm text-slate-600">បន្ទាប់</div>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <div className="text-2xl font-bold text-slate-700 mb-1">»»</div>
              <div className="text-sm text-slate-600">ទំព័រចុងក្រោយ</div>
            </div>
          </div>
        </section>

        {/* Quick Tips Section */}
        <section className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            ព័ត៌មានជំនួយ
          </h2>
          <ul className="space-y-2 text-slate-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>ប្រើ <strong>របារស្វែងរក</strong> ដើម្បីរកនាយកដ្ឋាន/បុគ្គលិកយ៉ាងឆាប់រហ័ស</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>ប្តូររវាងត្រង <strong>តាមឈ្មោះ</strong> និង <strong>តាមលេខសម្គាល់</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>ចុចឈ្មោះនាយកដ្ឋានដើម្បីរុករករវាងទិន្នន័យដែលពាក់ព័ន្ធ</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>ព័ត៌មានដែលត្រូវការទាំងអស់ត្រូវបានសម្គាល់ដោយ <strong className="text-red-600">សញ្ញា (*) ពណ៌ក្រហម</strong></span>
            </li>
          </ul>
        </section>

        {/* Support Section */}
        <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            ត្រូវការជំនួយ?
          </h2>
          <p className="text-slate-700">ទាក់ទងអ្នកគ្រប់គ្រងប្រព័ន្ធរបស់អ្នកសម្រាប់ជំនួយ។</p>
        </section>
      </div>
    </main>
  )
}

