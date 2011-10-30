console.log("Running sanity.js");

function getInactiveKey(bundleId) {
    return 'uk.co.goosoftware.app-id-sanity/' + bundleId + '/inactive';
}

if (document.location.href.match('/manage/bundles/index.action$')) {
    // Get all the rows in the table inside form#index
    $('form#index tr').each(function(index, tr){
        // Get the last <td> in the row - it contains the Configure link
        // where we'll find the bundle ID
        var tds = $(tr).find('td');

        if (tds.length) { // ignore the header row, which has <th> elements
            // Get the bundle ID from the Configure link
            var matches = tds.last().html().match('\\?displayId=([A-Z0-9]+)');
            if (matches) {
                var bundleId = matches[1];

                var is_inactive = localStorage.getItem(getInactiveKey(bundleId));
                if (is_inactive) {
                    $(tr).addClass('inactive');
                }

                var delete_td = $('<td style="vertical-align:middle; text-align:center;"></td>');
                var checkbox = $('<input type="checkbox"></input>');
                checkbox.prop('checked', !is_inactive);
                
                checkbox.click(function(event) {
                    var is_active = $(this).is(':checked');
                    if (is_active) {
                        $(tr).removeClass('inactive');
                        localStorage.setItem(getInactiveKey(bundleId), false);
                    } else {
                        $(tr).addClass('inactive');
                        localStorage.setItem(getInactiveKey(bundleId), true);
                    }
                });
                delete_td.append(checkbox);
                $(tr).append(delete_td);
            }
        } else {
            $(tr).append($('<th>Active</th>'));
        }
    });
} else if (document.location.href.match('/manage/provisioningprofiles/')) {
    $('select[name="cfBundleDisplayId"] option').each(function(index, option) {
        var bundleId = $(option).val();
        var is_inactive = localStorage.getItem(getInactiveKey(bundleId));
        console.log(bundleId + ': ' + is_inactive);
        if (bundleId.length && is_inactive) {
            $(option).remove();
        }
    });
}
