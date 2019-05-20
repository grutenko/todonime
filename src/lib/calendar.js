import API from './api';

function getAll() {
	return API.getInstance().getCalendar();
}