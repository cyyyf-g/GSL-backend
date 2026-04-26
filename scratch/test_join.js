import { supabase } from './src/supabase.js';

async function testQuery() {
    const { data, error } = await supabase
        .from('profiles')
        .select(`
            id,
            full_name,
            attendance!attendance_student_id_fkey!left ( id, class_id, status )
        `)
        .eq('role', 'student')
        .limit(1);

    if (error) {
        console.error('Error with constraint:', error.message);
    } else {
        console.log('Success with constraint!');
    }

    const { data: data2, error: error2 } = await supabase
        .from('profiles')
        .select(`
            id,
            full_name,
            attendance:attendance!attendance_student_id_fkey!left ( id, class_id, status )
        `)
        .eq('role', 'student')
        .limit(1);

    if (error2) {
        console.error('Error with alias + constraint:', error2.message);
    } else {
        console.log('Success with alias + constraint!');
    }
}

testQuery();
