(function() {
    'use strict';

    angular
        .module('Freelance')
        .factory('ToastFactory', ToastFactory);

    function ToastFactory (toaster,$translate) {

    	return {
			popSuccess : function(message, title) {
				toaster.pop({type: 'success',title: $translate.instant(title),body: $translate.instant(message)});
			},
			popErrors : function(message, title) {
				toaster.pop({type: 'error', title: $translate.instant(title), body: $translate.instant(message)});
			},
		}
    	
    }

})();