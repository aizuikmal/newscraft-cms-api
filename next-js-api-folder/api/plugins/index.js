

const Plugins = (req, res) => {

	const data = {
		'nc_todo_public': {
			name:'NC Software Update List',
			type: 'iframe',
			source: 'https://docs.google.com/spreadsheets/d/e/xxxxxxxxx&single=true',
			sidebar : {
				icon: 'FiTriangle',
				name: 'NC Update List',
				link: '/plugins/nc_todo_public',
			}
		},
		'mk_push_notification': {
			name: 'Push Notification',
			type: 'component',
			source: 'MkPushNotification',
			sidebar : {
				name: 'Push Notification',
				link: '/plugins/mk_push_notification',
			}
		},
		'comment-cp': {
			name: 'Comment CP',
			type: 'link',
			sidebar : {
				type: 'external',
				target: '_blank',
				name: 'Comment CP',
				link: 'https://xxxxxxxxx/admin',
			}
		},
		'mk_community_feedback': {
			name: 'Community Feedback',
			type: 'component',
			source: 'MkCommunityFeedbackSeries',
			sidebar : {
				name: 'Com. Feedback',
				link: '/plugins/mk_community_feedback',
			}
		},
		// 'crs': {
		// 	name: 'CRS',
		// 	type: 'iframe',
		// 	source: 'https://crs.malaysiakini.com/',
		// 	sidebar : {
		// 		title: 'CRS',
		// 		link: '/plugins/crs',
		// 	}
		// },
		'mk_story_analytics': {
			name: 'Malaysiakini - Story Analytics',
			type: 'iframe',
			source: 'https://datastudio.google.com/embed/reporting/xxxxxxxxx/page/MvWwB',
			sidebar : {
				name: 'Story Analytics',
				link: '/plugins/mk_story_analytics',
			}
		},
		'mk_user_summary': {
			name: 'Malaysiakini - User Summary',
			type: 'iframe',
			source: 'https://datastudio.google.com/embed/reporting/xxxxxxxxx/page/rDb2B',
			sidebar : {
				name: 'User Summary',
				link: '/plugins/mk_user_summary',
			}
		},
		'mk_friendlink_report': {
			name: 'Malaysiakini - Friendlink visitors',
			type: 'component',
			source: 'MkFriendlinkVisitor',
			sidebar : {
				name: 'Friendlink Visitor',
				link: '/plugins/mk_friendlink_report',
			},
		},
		'test': {
			name: 'Malaysiakini',
			type: 'iframe',
			source: 'https://www.malaysiakini.com/',
			sidebar : false
		}
	}

	res.json({status:'ok', data})

}

export default Plugins