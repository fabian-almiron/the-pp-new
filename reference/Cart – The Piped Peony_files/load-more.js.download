// jQuery(document).ready(function($) {
//     var ajaxUrl = mytheme_load_more_params.ajax_url;
//     var page = 2;
//     var load_more_button = $('#load-more-posts');
//     var query_vars = JSON.parse(mytheme_load_more_params.query_vars);
//     var term_slug = mytheme_load_more_params.term_slug;

//     load_more_button.on('click', function(e) {
//         e.preventDefault();
//         var data = {
//             'action': 'load_more_posts',
//             'page': page,
//             'post_type': 'courses', // You're always working with the 'courses' post type
//             'security': mytheme_load_more_params.security
//         };

//                     // Only add the term_slug and taxonomy parameters if they're set and not empty
//             if (term_slug && term_slug !== '') {
//                 data.term_slug = term_slug;
//             }
//             if (query_vars.taxonomy && query_vars.taxonomy !== '') {
//                 data.taxonomy = query_vars.taxonomy;
//             }

//             $.post(ajaxUrl, data, function(response) {
//               if (response != '') {
//                 $('#post-container').append(response);
//                 page++;
//             } else {
//                 load_more_button.hide();
//             }
//             });

//         // $.post(ajaxUrl, data, function(response) {
//         //     if (response != '') {
//         //         $('#post-container').append(response);
//         //         page++;
//         //     } else {
//         //         load_more_button.hide();
//         //     }
//         // });
//     });
// });


jQuery(document).ready(function($) {
    var ajaxUrl = mytheme_load_more_params.ajax_url;
    var page = 2;
    var load_more_button = $('#load-more-posts');
    var query_vars = JSON.parse(mytheme_load_more_params.query_vars);

    load_more_button.on('click', function(e) {
        e.preventDefault();
        var data = {
            'action': 'load_more_posts',
            'page': page,
            'post_type': query_vars.post_type,
            'security': mytheme_load_more_params.security
        };

        // If term_slug and taxonomy properties exist in mytheme_load_more_params, add them to data object
        if (mytheme_load_more_params.term_slug && mytheme_load_more_params.taxonomy) {
            data.term_slug = mytheme_load_more_params.term_slug;
            data.taxonomy = mytheme_load_more_params.taxonomy;
        }

        $.post(ajaxUrl, data, function(response) {
            if (response != '') {
                $('#post-container').append(response);
                page++;
            } else {
                load_more_button.hide();
            }
        });
    });
});
