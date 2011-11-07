var STATUS_ACTIVE = 'active';
var STATUS_INACTIVE = 'inactive';

function BundleId(bundleId) {
    this.bundleId = bundleId;
}

BundleId.prototype.isActive = function() {
    return localStorage.getItem(this.getActivityStatusKey()) == STATUS_INACTIVE;
}

BundleId.prototype.getActivityStatusKey = function() {
    return 'uk.co.goosoftware.app-id-sanity/' + this.bundleId + '/status';
}

BundleId.prototype.setActive = function(isActive) {
    localStorage.setItem(this.getActivityStatusKey(), isActive ? STATUS_ACTIVE : STATUS_INACTIVE);
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
                var bundleId = new BundleId(matches[1]);
                if (!bundleId.isActive()) {
                    $(tr).addClass('inactive');
                }

                var delete_td = $('<td style="vertical-align:middle; text-align:center;"></td>');

                var checkbox = $('<input type="checkbox"></input>');
                checkbox.prop('checked', bundleId.isActive());
                checkbox.click(function(event) {
                    var is_active = $(this).is(':checked');
                    bundleId.setActive(is_active);
                    $(tr).toggleClass('inactive', !is_active);
                });
                
                // Append checkbox to td, appent td to tr
                delete_td.append(checkbox);
                $(tr).append(delete_td);
            }
        } else {
            $(tr).append($('<th>Active</th>'));
        }
    });
} else if (document.location.href.match('/manage/provisioningprofiles/')) {
    $('select[name="cfBundleDisplayId"] option').each(function(index, option) {
        if ($(option).val().length == 0)
            return;
            
        var bundleId = new BundleId($(option).val());
        if (!bundleId.isActive()) {
            $(option).remove();
        }
    });
}
