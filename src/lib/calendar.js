import API from './shikimori-api';

function getAll() {
	return API.getInstance().getCalendar();
}